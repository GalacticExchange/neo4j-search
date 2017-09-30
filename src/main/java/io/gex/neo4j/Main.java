package io.gex.neo4j;


import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class Main {
    private static final Logger LOG = LoggerFactory.getLogger(Main.class);

    public static AppConfig appConf;

    public static void main(String args[]) {
        LOG.info("Started loading configuration file");
        try {
            appConf = loadConfig(args);
            LOG.info("Configuration file was loaded");
        } catch (IOException e) {
            LOG.error("Cannot load configuration file: " + e.getMessage(), e);
            System.exit(-1);
            return;
        }

        if (args.length > 1) {
            System.setProperty("devEnv", String.valueOf("-dev".equalsIgnoreCase(args[1])));
        }

        try {
            WebServer.start();
        } catch (Exception e) {
            LOG.error("Cannot start web server: " + e.getMessage(), e);
            System.exit(-1);
        }

    }

    private static AppConfig loadConfig(String[] args) throws IOException {
        if (args == null || args.length < 1 || StringUtils.isEmpty(args[0])) {
            throw new IOException("Path to configuration file not provided.");
        }

        String pathToConfStr = args[0];
        File pathToConf = new File(pathToConfStr);

        String fileContent = FileUtils.readFileToString(pathToConf, StandardCharsets.UTF_8);
        try {
            return new Gson().fromJson(fileContent, AppConfig.class);
        } catch (JsonSyntaxException e) {
            throw new IOException(e);
        }
    }
}