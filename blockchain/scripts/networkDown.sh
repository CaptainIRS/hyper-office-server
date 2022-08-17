#!/bin/bash

. scripts/setenv.sh
. scripts/utils.sh

# use this as the default docker-compose yaml definition
COMPOSE_FILE_BASE=docker/docker-compose-test-net.yaml
# docker-compose.yaml file if you are using couchdb
COMPOSE_FILE_COUCH=docker/docker-compose-couch.yaml
# certificate authorities compose file
COMPOSE_FILE_CA=docker/docker-compose-ca.yaml

# stop org3 containers also in addition to administration and stakeholders, in case we were running sample to add org3
IMAGE_TAG=$IMAGETAG docker-compose -f $COMPOSE_FILE_BASE -f $COMPOSE_FILE_COUCH down --volumes --remove-orphans
# Don't remove the generated artifacts -- note, the ledgers are always removed

# Bring down the network, deleting the volumes
# remove orderer block and other channel configuration transactions and certs
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf system-genesis-block/*.block organizations/peerOrganizations organizations/ordererOrganizations'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/administration/msp organizations/fabric-ca/administration/tls-cert.pem organizations/fabric-ca/administration/ca-cert.pem organizations/fabric-ca/administration/IssuerPublicKey organizations/fabric-ca/administration/IssuerRevocationPublicKey organizations/fabric-ca/administration/fabric-ca-server.db'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/stakeholders/msp organizations/fabric-ca/stakeholders/tls-cert.pem organizations/fabric-ca/stakeholders/ca-cert.pem organizations/fabric-ca/stakeholders/IssuerPublicKey organizations/fabric-ca/stakeholders/IssuerRevocationPublicKey organizations/fabric-ca/stakeholders/fabric-ca-server.db'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/ordererOrg/msp organizations/fabric-ca/ordererOrg/tls-cert.pem organizations/fabric-ca/ordererOrg/ca-cert.pem organizations/fabric-ca/ordererOrg/IssuerPublicKey organizations/fabric-ca/ordererOrg/IssuerRevocationPublicKey organizations/fabric-ca/ordererOrg/fabric-ca-server.db'
docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf channel-artifacts log.txt *.tar.gz'

