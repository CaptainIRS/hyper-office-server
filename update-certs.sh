#!/bin/bash

. .env

mkdir -p blockchain/organizations/peerOrganizations/stakeholders.hyper-office.tech/
mkdir -p blockchain/organizations/peerOrganizations/administration.hyper-office.tech/

echo "Getting connection profile of stakeholder organization..."
sshpass -p $SSH_PASSWORD scp $SSH_USERNAME@$SSH_HOST:$SSH_PATH/blockchain/organizations/peerOrganizations/stakeholders.hyper-office.tech/connection-stakeholders.json blockchain/organizations/peerOrganizations/stakeholders.hyper-office.tech/connection-stakeholders.json
echo "Getting connection profile of administration organization..."
sshpass -p $SSH_PASSWORD scp $SSH_USERNAME@$SSH_HOST:$SSH_PATH/blockchain/organizations/peerOrganizations/administration.hyper-office.tech/connection-administration.json blockchain/organizations/peerOrganizations/administration.hyper-office.tech/connection-administration.json

echo "Replacing localhost with hostname..."

sed -i "s/https:\/\/localhost/https:\/\/ca\.stakeholders\.$SSH_HOST/g" blockchain/organizations/peerOrganizations/stakeholders.hyper-office.tech/connection-stakeholders.json
sed -i "s/grpcs:\/\/localhost/grpcs:\/\/peer0\.stakeholders\.$SSH_HOST/g" blockchain/organizations/peerOrganizations/stakeholders.hyper-office.tech/connection-stakeholders.json

sed -i "s/https:\/\/localhost/https:\/\/ca\.administration\.$SSH_HOST/g" blockchain/organizations/peerOrganizations/administration.hyper-office.tech/connection-administration.json
sed -i "s/grpcs:\/\/localhost/grpcs:\/\/peer0\.administration\.$SSH_HOST/g" blockchain/organizations/peerOrganizations/administration.hyper-office.tech/connection-administration.json

rm -rf *-wallet
