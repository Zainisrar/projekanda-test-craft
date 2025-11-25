#!/usr/bin/expect

set timeout 60
set host "72.60.41.227"
set user "root"
set password "Sheikhjefrizal210879&&"
set local_dist "dist"
set remote_dir "/var/www/projekanda"

# 1. Install Nginx
spawn ssh $user@$host "apt-get update && apt-get install -y nginx"
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "password:" { send "$password\r" }
}
expect eof

# 2. Upload files
spawn scp -r $local_dist $user@$host:/tmp/
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "password:" { send "$password\r" }
}
expect eof

# 3. Move files and Restart Nginx
spawn ssh $user@$host "mkdir -p $remote_dir && rm -rf $remote_dir/* && mv /tmp/$local_dist/* $remote_dir/ && rm -rf /tmp/$local_dist && chown -R www-data:www-data $remote_dir && systemctl restart nginx"
expect {
    "password:" { send "$password\r" }
}
expect eof

puts "\nDeployment complete!"
