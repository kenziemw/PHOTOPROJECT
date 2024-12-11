#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d photoproject.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email intexgroup310@gmail.com