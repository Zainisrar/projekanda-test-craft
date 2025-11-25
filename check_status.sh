#!/usr/bin/expect

set timeout 60
set host "72.60.41.227"
set user "root"
set password "Sheikhjefrizal210879&&"

spawn ssh $user@$host "systemctl status nginx && netstat -tuln | grep 80"
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "password:" { send "$password\r" }
}
expect eof
