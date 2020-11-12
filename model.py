from app import db
from datetime import datetime


pcrel = db.Table('pcrel',
                 db.Column('post_id', db.Integer, db.ForeignKey('posts.pid')),
                 db.Column('cat_id', db.Integer, db.ForeignKey('categories.cid'))
                 )


class Category(db.Model):
    __tablename__ = 'categories'

    cid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    slug = db.Column(db.String(50), unique=True)
    posts = db.relationship('Post', backref=db.backref('posts', lazy='dynamic'),
                            secondary=pcrel)


class Post(db.Model):
    __tablename__ = 'posts'

    pid = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String(10), db.ForeignKey('admins.userid'))
    title = db.Column(db.String(100))
    slug = db.Column(db.String(150))
    img = db.Column(db.String(100))
    create = db.Column(db.String(15), default=datetime.now().date())
    excerpt = db.Column(db.String(100))
    ccount = db.Column(db.Integer)
    content = db.Column(db.TEXT)

    # posts = db.relationship('Post', secondary='posts', backref=db.backref('cats', lazy='dynamic'))

class Admin(db.Model):
    __tablename__ = 'admins'

    aid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.String(10), unique=True)
    name = db.Column(db.String(30))
    contact = db.Column(db.String(10))
    about = db.Column(db.String(100))
    img = db.Column(db.String(100))
    email = db.Column(db.String(50))
    password = db.Column(db.String(256))
    posts = db.relationship('Post', backref='writer')

class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    post = db.Column(db.Integer, db.ForeignKey('posts.pid'))
    name = db.Column(db.String(20))
    email = db.Column(db.String(20))
    content = db.Column(db.String(150))
    time = db.Column(db.DateTime, default=datetime.now())


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20))
    email = db.Column(db.String(20))
    subject = db.Column(db.String(50))
    content = db.Column(db.String(200))
    time = db.Column(db.DateTime, default=datetime.now())


class Subscribe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50))


'''
from app import *
from model import *
p = pwd_context.hash('admin')
a = Admin (userid='sinmrinal', name = 'Mrinal Singh', password='admin')
'''
