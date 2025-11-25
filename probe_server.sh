#!/usr/bin/expect

set timeout 20
set host "72.60.41.227"
set user "root"
set password "Sheikhjefrizal210879&&"

spawn ssh -o StrictHostKeyChecking=no $user@$host "ls -F /home/ && echo '---' && ls -F /home/*/htdocs/ 2>/dev/null || echo 'No htdocs found'"

expect {
    "password:" { send "$password\r" }
    timeout { puts "Connection timed out"; exit 1 }
}

expect eof
