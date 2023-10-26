#! /bin/sh
export APP="apps/dev-server"
export DIST="dist/apps/dev-server"
cp -r ${APP}/src/assets $DIST
cp -r ${DIST}/lib/components $DIST/assets/lib/
