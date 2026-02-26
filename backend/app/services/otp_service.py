from datetime import datetime, timedelta
import random
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client
from sqlalchemy.orm import Session
from ..models import User, OTP

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email_otp(email: str, otp_code: str):
    message = Mail(
        from_email=os.getenv('FROM_EMAIL'),
        to_emails=email,
        subject='Your OTP Code',
        html_content=f'<strong>Your OTP code is: {otp_code}</strong><br>Valid for 10 minutes.'
    )
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def send_sms_otp(mobile: str, otp_code: str):
    try:
        client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
        message = client.messages.create(
            body=f'Your OTP code is: {otp_code}. Valid for 10 minutes.',
            from_=os.getenv('TWILIO_PHONE_NUMBER'),
            to=mobile
        )
        return True
    except Exception as e:
        print(f"SMS error: {e}")
        return False

def create_otp_record(db: Session, user_id: int, otp_type: str):
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    otp = OTP(
        user_id=user_id,
        otp_code=otp_code,
        otp_type=otp_type,
        expires_at=expires_at
    )
    db.add(otp)
    db.commit()
    db.refresh(otp)
    return otp_code

def verify_otp(db: Session, user_id: int, otp_code: str):
    otp = db.query(OTP).filter(
        OTP.user_id == user_id,
        OTP.otp_code == otp_code,
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).first()
    
    if otp:
        otp.is_used = True
        db.commit()
        return True
    return False