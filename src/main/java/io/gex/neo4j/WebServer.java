package io.gex.neo4j;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import io.gex.neo4j.webpack.WebpackThread;
import org.apache.commons.lang3.StringUtils;
import org.neo4j.driver.v1.Session;
import org.neo4j.driver.v1.StatementResult;
import org.neo4j.driver.v1.types.Node;
import org.neo4j.driver.v1.types.Relationship;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.standard.StandardDialect;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.FileTemplateResolver;
import spark.Response;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.neo4j.driver.v1.Values.parameters;
import static spark.Spark.*;


public class WebServer {
    private static final Logger LOG = LoggerFactory.getLogger(WebServer.class);

    private static TemplateEngine templateEngine;
    private static Gson gson = new Gson();

    public static void start() {
        initAssetsPath();
        port(Main.appConf.getWebServerPort());

        get("/", (request, response) -> {
            List<String> nodeTypes;
            try (Session session = Neo4jConnector.getSession()) {
                StatementResult result = session.run("MATCH (n) RETURN distinct labels(n) as label");
                nodeTypes = result.list(record -> record.get(0).get(0).asString());
            }

            Map<String, Object> model = new HashMap<>();
            model.put("nodeTypes", nodeTypes);

            return renderTemplate("index.html", model);
        });

        get("/nodes/find", "application/json", (request, response) -> {
            String name = request.queryParams("name");
            if (StringUtils.isEmpty(name)) {
                return createErrResp(response, 400, new Exception("Name parameter cannot be empty"));
            }

            JsonArray nodes = new JsonArray();
            try (Session session = Neo4jConnector.getSession()) {
                String query = "match (n) WHERE lower(n.name) CONTAINS {nameValue} OR lower(n.title) CONTAINS {nameValue} return n";
                StatementResult result = session.run(query, parameters("nameValue", name.toLowerCase()));
                result.forEachRemaining(record -> nodes.add(nodeToJson(record.values().get(0).asNode())));
            }


            JsonObject result = new JsonObject();
            result.add("nodes", nodes);
            return result.toString();
        });


        get("/nodes/:id/neighbours", "application/json", (request, response) -> {
            Long id;
            try {
                id = Long.valueOf(request.params(":id"));
            } catch (NumberFormatException e) {
                return createErrResp(response, 400, new Exception("Node ID cannot be empty."));
            }

            List<Long> loadedNodesIds = gson.fromJson(request.queryParams("loadedNodesIds"), new TypeToken<List<Long>>() {
            }.getType()); //todo validate


            JsonObject resJson = new JsonObject();

            try (Session session = Neo4jConnector.getSession()) {
                String query = "MATCH (n) WHERE ID(n) = {id} RETURN n";
                StatementResult result = session.run(query, parameters("id", id));
                resJson.add("node", nodeToJson(result.single().values().get(0).asNode()));


                Map<Long, JsonObject> newNodes = new HashMap<>();
                query = "MATCH (n)-[r]-(m) WHERE ID(n) = {id} AND NOT ID(m) IN {loadedNodes} RETURN m"; //todo optimize with WITH
                result = session.run(query, parameters("id", id, "loadedNodes", loadedNodesIds));
                result.forEachRemaining(record -> {
                    Node node = record.get(0).asNode();
                    if (node.id() != id && !newNodes.containsKey(node.id())) {
                        newNodes.put(node.id(), nodeToJson(node));
                    }
                });
                resJson.add("neighbours", gson.toJsonTree(newNodes.values()));

                if (!loadedNodesIds.contains(id)) {
                    newNodes.put(id, resJson.getAsJsonObject("node"));
                }
                Map<Long, JsonObject> relations = new HashMap<>();
                if (!newNodes.isEmpty()) {
                    List<Long> allNodesWithNew = new ArrayList<>(loadedNodesIds);
                    allNodesWithNew.addAll(newNodes.keySet());

                    query = "MATCH (n)-[r]-(m) WHERE ID(n) IN {ids} AND ID(m) IN {ids2} RETURN r";
                    result = session.run(query, parameters("ids", newNodes.keySet(), "ids2", allNodesWithNew));
                    result.forEachRemaining(record -> {
                        Relationship relation = record.get(0).asRelationship();
                        if (!relations.containsKey(relation.id())) {
                            relations.put(relation.id(), relationshipToJson(relation));
                        }
                    });
                }
                resJson.add("relationships", gson.toJsonTree(relations.values()));
            }

            return resJson.toString();
        });


        get("/nodes", "application/json", (request, response) -> {
            //todo  create top request,  don't return all
            JsonObject results = new JsonObject();
            try (Session session = Neo4jConnector.getSession()) {
                JsonArray nodes = new JsonArray();
                StatementResult result = session.run("MATCH (n) RETURN n");
                result.forEachRemaining(record -> {
                    Node node = record.get(0).asNode();
                    nodes.add(nodeToJson(node));
                });
                results.add("nodes", nodes);

                JsonArray relationships = new JsonArray();
                result = session.run("MATCH ()-[r]-() RETURN r");
                result.forEachRemaining(record -> {
                    Relationship relationship = record.get(0).asRelationship();
                    relationships.add(relationshipToJson(relationship));
                });
                results.add("relationships", relationships);
            } catch (Exception e) {
                return createErrResp(response, 500, e);
            }

            return results.toString();
        });

        get("/nodes/:id", "application/json", (request, response) -> {
            Long id;
            try {
                id = Long.valueOf(request.params(":id"));
            } catch (NumberFormatException e) {
                return createErrResp(response, 400, new Exception("Node ID cannot be empty."));
            }

            JsonObject resJson = new JsonObject();

            try (Session session = Neo4jConnector.getSession()) {
                String query = "MATCH (n) WHERE ID(n) = {id} RETURN n";
                StatementResult result = session.run(query, parameters("id", id));
                resJson.add("node", nodeToJson(result.single().values().get(0).asNode()));
            }

            return resJson.toString();
        });

    }

    private static String createErrResp(Response res, int status, Exception e) {
        return createErrResp(res, status, e.getMessage(), e);
    }

    private static String createErrResp(Response res, int status, String message, Exception e) {
        LOG.error(message, e);
        res.status(status);
        JsonObject errBase = new JsonObject();
        errBase.addProperty("message", message);

        return errBase.toString();
    }


    private static JsonObject nodeToJson(Node node) {
        JsonObject json = new JsonObject();
        json.addProperty("id", node.id());
        json.add("types", gson.toJsonTree(node.labels()));
        json.add("properties", gson.toJsonTree(node.asMap()));

        return json;
    }

    private static JsonObject relationshipToJson(Relationship relationship) {
        JsonObject json = new JsonObject();
        json.addProperty("id", relationship.id());
        json.addProperty("source", relationship.startNodeId());
        json.addProperty("target", relationship.endNodeId());
        json.addProperty("type", relationship.type());
        json.add("properties", gson.toJsonTree(relationship.asMap()));

        return json;
    }

    private static void initAssetsPath() {
        templateEngine = new org.thymeleaf.TemplateEngine();
        StandardDialect dialect = (StandardDialect) templateEngine.getDialects().stream()
                .filter(d -> d instanceof StandardDialect).findFirst().get();
        dialect.setJavaScriptSerializer(gson::toJson);

        if (Boolean.valueOf(System.getProperty("devEnv"))) {
            String projectDir = System.getProperty("user.dir");
            String staticDir = "/src/main/frontend/";
            staticFiles.externalLocation(projectDir + staticDir);

            FileTemplateResolver resolver = new FileTemplateResolver();
            resolver.setSuffix(".html");
            resolver.setPrefix("src/main/frontend/html/");
            resolver.setTemplateMode(TemplateMode.HTML);
            resolver.setCacheable(false);
            templateEngine.setTemplateResolver(resolver);

            WebpackThread.run();
        } else {
            staticFiles.location("/assets");

            final long DEFAULT_CACHE_TTL_MS = 3600000L;
            ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
            templateResolver.setTemplateMode(TemplateMode.HTML);
            templateResolver.setPrefix("assets/html/");
            templateResolver.setSuffix(".html");
            templateResolver.setCacheTTLMs(DEFAULT_CACHE_TTL_MS);
            templateEngine.setTemplateResolver(templateResolver);
        }
    }

    private static String renderTemplate(String viewName, Object model) {
        if (model instanceof Map) {
            Context context = new Context();
            context.setVariables((Map<String, Object>) model);
            return templateEngine.process(viewName, context);
        } else {
            throw new IllegalArgumentException("modelAndView.getModel() must return a java.util.Map");
        }
    }
}
