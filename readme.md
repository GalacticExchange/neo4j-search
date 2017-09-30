### Dependencies
1. Oracle Java 8
    * `sudo add-apt-repository ppa:webupd8team/java`
    * `sudo apt-get update`
    * `sudo apt-get install oracle-java8-installer`
    * `sudo apt-get install oracle-java8-set-default`
2. Maven
    * `sudo apt-get update`
    * `sudo apt-get install maven`
3. Node.js 6.x and npm
    * `curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`
    * `sudo apt-get install -y nodejs`

### Build
1. Go to project folder
2. Run `mvn clean install`
3. Find new build in path `target/neo4j-search.jar`

### Build and deploy 
1. Install Ruby
    * `sudo apt-get update`
    * `sudo apt-get install ruby`
2. Install Rake
    * `sudo gem install rake`
3. Clone repository framework_templates to the same parent folder
4. Clone repository gexcloud as vagrant to the same parent folder
5. Go to parent_folder/framework_templates/graph_ide
6. Run `rake build_web`
7. Run `sudo rake build`
8. Clone appstore-apps to the same parent folder
9. Go to parent_folder/appstore-apps
10. Increment version in /appstore-apps/apps/graph_ide/build_config.rb
11. Run `gex_env=main rake deploy:upload['graph_ide']`

### Debug
1. Build project
2. Application needs Neo4j running.
    * `docker run --publish=7474:7474 --publish=7687:7687 --volume=$HOME/neo4j/data:/data neo4j:3.2.2-enterprise`
3. For logs you should create folder with path `/usr/local/graph_ide` with write permissions to all
4. Run project from main class(io.gex.neo4j.Main) with two parameters path_to_config and -dev
    * Config file example `{
       "appId": "12345",
       "webServerPort": 4567,
       "consulHost": "10.1.0.16",
       "consulPort": 8500,
       "neo4jHost": "10.1.0.16",
       "neo4jPort": 7687,
       "neo4jUser": "neo4j",
       "neo4jPass": "neo4jPass"
     }`

5. Go to http://0.0.0.0:3000. By default for debug start up two web servers: java web server on port 4567 and node.js web server on port 3000 which proxy java web server for dynamically adding assets.