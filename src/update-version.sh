#!/bin/bash
set -e

update_version(){
       if [[ "$DONT_BUMP_VERSION" -ne "1" ]]
       then
            echo " Bumping version.. "
       else
            echo "Version will not be bumped since variable DONT_BUMP_VERSION is set."
            exit 0
       fi

      old_version=`cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]'`
      version_split=( ${old_version//./ } )

      #increment the number at the 3rd position ( 0,1,2 )
      ((version_split[2]++))

      new_version="${version_split[0]}.${version_split[1]}.${version_split[2]}"

      # overwrite it in the package.json file
      sed -i -e "0,/$old_version/s/$old_version/$new_version/" package.json
}

# show off the old version
npm version | head -1

update_version

# show off the updated version
npm version | head -1

# track the change
git add package.json