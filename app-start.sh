docker version
if [ $? -ne 0 ]; then
    echo "This project will not run properly as docker is not installed on your system."
    exit 1;
fi

docker network create -d bridge --attachable nodejs-mysql-network

docker inspect pwmanager-basic_mysqldb
if ! [ $? -eq 0 ]; then
    docker load -i mysqldb.tar
fi

docker inspect pwmanager-basic_app
if ! [ $? -eq 0 ]; then
    docker load -i app.tar
fi


docker inspect mysqldb
if [ $? -eq 0 ]; then
    docker start mysqldb
else
    docker run --name mysqldb --network nodejs-mysql-network -p 3306:3306 -d pwmanager-basic_mysqldb
fi

while true; do
    curl localhost:3306
    RESULT=$?
    echo $RESULT
    if [ $RESULT -eq 1 ]; then
        break
    fi
    sleep 3
done

docker inspect app
if [ $? -eq 0 ]; then
    docker start app
else
    docker run --name app --network nodejs-mysql-network -p 3000:3000 -d pwmanager-basic_app
fi