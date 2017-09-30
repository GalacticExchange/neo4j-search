package io.gex.neo4j;


public class AppConfig {
    private String appId;
    private Integer webServerPort;
    private String consulHost;
    private Integer consulPort;
    private String neo4jHost;
    private Integer neo4jPort;
    private String neo4jUser;
    private String neo4jPass;

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public Integer getWebServerPort() {
        return webServerPort;
    }

    public void setWebServerPort(Integer webServerPort) {
        this.webServerPort = webServerPort;
    }

    public String getConsulHost() {
        return consulHost;
    }

    public void setConsulHost(String consulHost) {
        this.consulHost = consulHost;
    }

    public Integer getConsulPort() {
        return consulPort;
    }

    public void setConsulPort(Integer consulPort) {
        this.consulPort = consulPort;
    }

    public String getNeo4jHost() {
        return neo4jHost;
    }

    public void setNeo4jHost(String neo4jHost) {
        this.neo4jHost = neo4jHost;
    }

    public Integer getNeo4jPort() {
        return neo4jPort;
    }

    public void setNeo4jPort(Integer neo4jPort) {
        this.neo4jPort = neo4jPort;
    }

    public String getNeo4jUser() {
        return neo4jUser;
    }

    public void setNeo4jUser(String neo4jUser) {
        this.neo4jUser = neo4jUser;
    }

    public String getNeo4jPass() {
        return neo4jPass;
    }

    public void setNeo4jPass(String neo4jPass) {
        this.neo4jPass = neo4jPass;
    }
}
