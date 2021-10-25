#! /bin/bash

title="WASP API GraphQL Schema"
prologue="This document describes the GraphQL API schema for \`wasp-api\`"

echo "Starting API"

# start the api node so we can query it for the schema
DB_NAME=wasp NODE_ENV=test node ./app/index.js > /dev/null &
api_pid=$!

# loop and wait until the healthcheck API is up
safety_counter=1
while [ $safety_counter -le 10 ]
do
  sleep 1
  echo "API started (waiting for it to be up - $((11 - safety_counter)))"
  result=$(curl -o /dev/null -s -w '%{http_code}\n' 'http://localhost:3001/health')
  if [ $result -eq 200 ]; then
      break
  fi
  safety_counter=$(( $safety_counter + 1 ))
done

if [ $safety_counter -gt 10 ]
then
  echo "Error - API did not startup as expected"
  # close the API
  kill $api_pid
  exit 1
else
  echo "API started"
  echo "Generating documentation"
  # generate the schema
  npx graphql-markdown --title "$title" --prologue "$prologue" http://localhost:3001/graphql > ./docs/schema.md
  echo "Documentation generated"
  # close the API
  kill $api_pid
  exit 0
fi

