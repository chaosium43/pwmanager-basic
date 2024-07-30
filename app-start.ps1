docker version
if (!$?) {
    "This project will not run properly as docker is not installed on your system."
    exit 1
}

docker network create -d bridge --attachable nodejs-mysql-network

docker inspect pwmanager-basic_mysqldb
if (!$?) {
    docker load -i mysqldb.tar
}

docker inspect pwmanager-basic_app
if (!$?) {
    docker load -i app.tar
}

docker inspect mysqldb
if ($?) {
    docker start mysqldb
} else {
    docker run --name mysqldb --network nodejs-mysql-network -p 3306:3306 -v ./db_data:/var/lib/mysql -d pwmanager-basic_mysqldb
}

docker inspect app
if ($?) {
    docker start app
} else {
    docker run --name app --network nodejs-mysql-network -p 3000:3000 -d pwmanager-basic_app
}

$health = 0
while ($health -lt 3) {
    $result = docker container inspect -f '{{.State.Status}}' app
    $result
    if ($result -eq "running") {
        $health = $health + 1
    } else {
        $health = 0
        docker start app
    }
    Start-Sleep -s 3
}