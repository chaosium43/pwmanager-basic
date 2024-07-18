create database pwdapplication;
use pwdapplication;
create table accounts (
    id bigint not null,
    username char(20) not null, 
    hash char(64) not null, 
    salt char(8) not null,
    primary key (id)
);

create table userdata (
    id bigint not null,
    dataid bigint not null,
    website varchar(20) not null,
    username varchar(20) not null,
    password varchar(20) not null,
    foreign key (id) references accounts(id)
);

create unique index usernameIndex on accounts (username);
create unique index idIndex on accounts (id);
create index idJoinIndex on userdata (id);
create user loginsdatabase@localhost identified with mysql_native_password by 'YOUR-PASSWORD-HERE';
grant all privileges on pwdapplication.* to loginsdatabase@localhost;
flush privileges;