#!/usr/bin/expect

set timeout 60
set host "72.60.41.227"
set user "root"
set password "Sheikhjefrizal210879&&"

spawn ssh $user@$host "cat /etc/nginx/sites-enabled/default.conf"
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "password:" { send "$password\r" }
}
expect eof
