#!/bin/bash

# Download the WebUI files since our swarm is not connected to the public IPFS network
mkdir -p webui
pushd webui
curl https://ipfs.io/api/v0/get/bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q | tar -xf -
wget -O bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q.dag -c "https://ipfs.io/api/v0/dag/export?arg=bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q"
popd
