#!/usr/bin/expect

set timeout 60
set host "72.60.41.227"
set user "root"
set password "Sheikhjefrizal210879&&"
set config_content "server { listen 80 default_server; server_name _; root /var/www/html; index index.html; location / { try_files \$uri \$uri/ /index.html; } }"

spawn ssh $user@$host "rm /etc/nginx/sites-enabled/default.conf && echo '$config_content' > /etc/nginx/sites-enabled/app.conf && systemctl restart nginx"
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "password:" { send "$password\r" }
}
expect eof
