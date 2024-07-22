create database pwdapplication;
use pwdapplication;
create table accounts (
    id bigint not null,
    username char(20) not null, 
    hash char(64) not null, 
    salt char(8) not null,
    primary key (username)
);

create table userdata (
    id bigint not null,
    dataid bigint not null,
    website char(100) not null,
    username varchar(20) not null,
    password varchar(20) not null
);

create table history (
    id bigint,
    ip tinytext not null,
    action char(20) not null,
    details text not null,
    timestamp datetime not null
);

create unique index usernameIndex on accounts (username);
create unique index idIndex on accounts (id);
create index idJoinIndex on userdata (id);
create index userActionIndex on history (id);
create index timeIndex on history (timestamp);

alter table userdata add foreign key (id) references accounts(id);
create user loginsdatabase@localhost identified with mysql_native_password by 'YOUR-PASSWORD-HERE';
grant all privileges on pwdapplication.* to loginsdatabase@localhost;
flush privileges;