#!/usr/bin/env bash

# this script depend on jq and lokalise2; use brew to install them; 

set -e
set -u

rm -rf .lokalise

lokalise2 file download --unzip-to=.lokalise --original-filenames=false --placeholder-format=i18n --format json  --token $LOKALISE_TOKEN   --project-id $LOKALISE_PROJECT_ID 

mkdir .lokalise/output

for file in `ls .lokalise/locale`; do
    cat ".lokalise/locale/${file}" | jq 'to_entries | [.[] | { key: .key, value: { message: .value} }] | from_entries' >> ".lokalise/output/${file}"
done