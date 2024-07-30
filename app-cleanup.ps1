docker stop app
docker stop mysqldb
docker rm app
docker rm mysqldb
docker volume prune
docker network prune
docker image rm pwmanager-basic_mysqldb
docker image rm pwmanager-basic_app