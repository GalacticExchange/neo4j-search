package io.gex.neo4j;

import org.neo4j.driver.v1.AuthTokens;
import org.neo4j.driver.v1.Driver;
import org.neo4j.driver.v1.GraphDatabase;
import org.neo4j.driver.v1.Session;

import static io.gex.neo4j.Main.appConf;


public class Neo4jConnector {
    private static volatile Driver driver;

    private Neo4jConnector() {

    }

    private static void openDriver(String host, int port, String username, String password) {
        driver = GraphDatabase.driver("bolt://" + host + ":" + port, AuthTokens.basic(username, password));
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (driver != null) {
                driver.close();
            }
        }));
    }

    public static Session getSession() {
        if (driver == null) {
            synchronized (Neo4jConnector.class) {
                if (driver == null) {
                    openDriver(appConf.getNeo4jHost(), appConf.getNeo4jPort(), appConf.getNeo4jUser(), appConf.getNeo4jPass());
                }
            }
        }

        return driver.session();
    }

}
