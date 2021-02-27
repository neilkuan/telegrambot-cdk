import json
import logging
import os
import subprocess
import time
import requests
from  base64 import decode
import sys
import validators

log_format = logging.Formatter('[%(asctime)s] [%(levelname)s] - %(message)s')
logger = logging.getLogger()
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(log_format)
logger.setLevel(logging.INFO)
logger.addHandler(handler)

urlToken = os.environ.get('URLTOKEN', 'URLTOKEN')
token = os.environ.get('TELEGRAM_TOKEN', 'TELEGRAM_TOKEN')
headers = {
    'Authorization': 'Bearer {TOKEN}'.format(TOKEN=urlToken),
    'Content-Type': 'application/json'}

def check_url(input: str):
  if validators.url(input):
    return {
      'check': True,
      'value': input
    }
  else:
    return {
      'check': False,
    }

def get_link(res):
  return json.loads(res.content.decode()).get('link')

def send_Message(chat_id:str, url: str):
  res = requests.get('https://api.telegram.org/bot{token}/sendMessage?chat_id={chat_id}&text={url}'.format(token=token,chat_id=chat_id, url=url))
  finalres = json.loads(res.content.decode())

  status = {
    "status": finalres.get('ok'),
    "chatid": finalres.get('result').get('chat').get('username') or finalres.get('result').get('chat').get('first_name'),
    "text": finalres.get('result').get('text'),
  }
  return status

def send_Message_echo(chat_id:str, msg: str):
  res = requests.get('https://api.telegram.org/bot{token}/sendMessage?chat_id={chat_id}&text={mes}'.format(token=token,chat_id=chat_id, mes='echo {msg} or Please input url thanks'.format(msg=msg)))
  finalres = json.loads(res.content.decode())

  status = {
    "status": finalres.get('ok'),
    "chatid": finalres.get('result').get('chat').get('username') or finalres.get('result').get('chat').get('first_name'),
    "text": finalres.get('result').get('text'),
  }
  return status

def lambda_handler(event, context):
  logger.info(json.dumps(event))
  # "log in" to the cluster
  chat_id = json.loads(event.get('body')).get('message').get('chat').get('id')
  
  try:
    text = json.loads(event.get('body')).get('message').get('text')
      # check text is validators url. 
    if check_url(text).get('check'):
      data = {"long_url": text,"domain": "bit.ly","title": "Bitly API Documentation"}
      data = json.dumps(data)
      response = requests.post('https://api-ssl.bitly.com/v4/bitlinks', headers=headers, data=data)
      logger.info(get_link(response))
      ## sendToTelegram
      sendToTelegram = send_Message(chat_id, get_link(response))
      # logger for send message
      logger.info(sendToTelegram)
      return { 'status': 200 }
    else:
      sendToTelegram = send_Message_echo(chat_id, text)
      logger.info(sendToTelegram)
      return { 'status': 200 }
  except:
    sendToTelegram = send_Message(chat_id, 'Not support this Type')
    logger.info(sendToTelegram)
    return { 'status': 200 }
  
  

  