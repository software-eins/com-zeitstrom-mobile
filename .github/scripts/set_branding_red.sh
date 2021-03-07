#!/bin/bash

set -euxo pipefail

# Set vue environment
mv .env .env.debug
mv .env.red .env
