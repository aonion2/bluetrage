for i in {0..499}
do
  cd /Users/kensuke/Desktop/bluetrage/server/order;
  node callsendorder.js >> ../../log/callsendorder.log
  cd ../../script
done
