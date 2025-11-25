#!/usr/bin/expect

set timeout 20
set host "72.60.41.227"
set user "root"
set password "Sheikhjefrizal210879&&"

spawn ssh -o StrictHostKeyChecking=no $user@$host "cat /etc/nginx/sites-available/projekanda /etc/nginx/sites-available/projekanda.top.conf"

expect {
    "password:" { send "$password\r" }
    timeout { puts "Connection timed out"; exit 1 }
}

expect eof
