
create table if not exists category (
  cid      int unsigned not null  primary key,
  name    char(50) not null,
  ord     int unsigned not null,
  description    varchar(1000)

);

create table if not exists diet(
  did     int  not null primary key,
  name    char(50) not null,
  price   float(8,2) not null,
  ord     int unsigned not null,
  base    float(8,2) not null,s
  cid     int unsigned not null ,
  picture char(100),s
  description    varchar(1000)
);

create table if not exists faculty (
  fid      char(100) not null primary key,
  name    char(50) not null,
  role    char(50) not null,
  password  char(50) not null
);


create table if not exists order_history (
  th      bigint unsigned not null  primary key auto_increment,
  uid     char(50) not null,
  did      int  not null,
  num     float(8,2) not null,
  puid    bigint unsigned not null,
  desk    char(20) not null,
  stamp   double(20,5) not null
);


create table if not exists cook_history (
  th bigint unsigned not null primary key auto_increment,
  fid char(50) not null,
  uid char(50) not null,
  did  int  not null,
  num  float(8,2) not null,
  stamp double(20,5) not null
);

create table if not exists feedback (

  th  bigint unsigned not null primary key auto_increment,
  uid char(50) not null,
  did int unsigned not null,
  num float(8,2) not null,
  fb  int not null,
  stamp double(20,5) not null
);

create table if not exists stat_week (
  th  bigint unsigned not null primary key auto_increment,
  did   int unsigned not null,

  num  float(10,2) not null,
  stamp_from char(20) not null,
  stamp_to char(20) not null
);

create table if not exists stat_month (

  th  bigint unsigned not null primary key auto_increment,
  did   int unsigned not null,

  num  float(10,2) not null,
  stamp_from char(20) not null,
  stamp_to char(20) not null
);


create table if not exists desks (
 desk char(20) not null primary key
);
