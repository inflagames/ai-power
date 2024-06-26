#!/bin/bash

# compress file name
ZIP_NAME=${1:-"game"}
GAME_ZIP_FILE_NAME="$ZIP_NAME.zip"

# delete file if exists
delFile() {
  if [ -f "$1" ]; then
    rm $1
  fi
}
export -f delFile

delFile ${GAME_ZIP_FILE_NAME}
delFile "dist/.gitkeep"
ls dist | grep -P ".*map$" | xargs bash -c 'for arg; do delFile "dist/$arg"; done' _

cd dist && zip -r -9 $GAME_ZIP_FILE_NAME *
cd .. && mv dist/$GAME_ZIP_FILE_NAME ./$GAME_ZIP_FILE_NAME

FILE_SIZE_BYTE=$(du -b $GAME_ZIP_FILE_NAME | cut -f1)
FILE_SIZE=$((FILE_SIZE_BYTE / 1024))
MISSING=$((13*1024-FILE_SIZE_BYTE))

if (( $FILE_SIZE > 13 )); then
  echo "-----------------------------------------"
  echo "| FILE NOT VALID FOR JS13KGAMES CONTEST (${FILE_SIZE}KB) |"
  echo "-----------------------------------------"
#  exit 27
else
  echo "------------------------------------------------------------"
  echo "| ${FILE_SIZE}KB (${FILE_SIZE_BYTE} BYTES) OF 13KB, STILL ${MISSING} BYTES LEFT, GAME ON |"
  echo "------------------------------------------------------------"
fi
