from os import name
from flask import Flask, render_template, redirect, session, request, flash
from flask_sqlalchemy import SQLAlchemy
from passlib.context import CryptContext
import json
import types

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    default="pbkdf2_sha256",
    pbkdf2_sha256__default_rounds=30000
)

app = Flask(__name__)

with open('config.json', 'r') as c:
    from_json = json.load(c)["app_config"]

app.secret_key = 'XXXXX'
app.config['UPLOAD_FOLDER'] = from_json['upload_location']
app.config['SQLALCHEMY_DATABASE_URI'] = from_json['database_uri']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.config['MAIL_SERVER'] = ''
app.config['MAIL_PORT'] = ''
app.config['MAIL_USERNAME'] = ''
app.config['MAIL_PASSWORD'] = ''
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

from model import Admin, Category, Comment, Message, Post


@app.route('/')
def landing():
    categories = Category.query.order_by(Category.name).all()
    # posts = Post.query.all()
    if 'userid' in session and session['userid'] in Admin.query.filter_by(userid=session['userid']).first().userid:
        detail = Admin.query.filter_by(userid=session['userid']).first()
        if pwd_context.verify(session['password'], detail.password):
            return render_template('index.html', name=detail.name, categories=categories)
    return render_template('index.html', categories=categories)




@app.route('/category/<string:catslug>')
def category_lander(catslug):
    categories = Category.query.order_by(Category.name).all()
    posts = Post.query.filter_by(slug=catslug).all()
    if 'userid' in session and session['userid'] in Admin.query.filter_by(userid=session['userid']).first().userid:
        detail = Admin.query.filter_by(userid=session['userid']).first()
        if pwd_context.verify(session['password'], detail.password):
            return render_template('index.html', name=detail.name, posts=posts, categories=categories)
    return render_template('index.html', categories=categories, posts=posts)


@app.route('/about')
def about():
    if 'userid' in session and session['userid'] in Admin.query.filter_by(userid=session['userid']).first().userid:
        detail = Admin.query.filter_by(userid=session['userid']).first()
        if pwd_context.verify(session['password'], detail.password):
            return render_template('about.html', name=detail.name)
    return render_template('about.html')


@app.route('/contact')
def contact():
    if 'userid' in session and session['userid'] in Admin.query.filter_by(userid=session['userid']).first().userid:
        detail = Admin.query.filter_by(userid=session['userid']).first()
        if pwd_context.verify(session['password'], detail.password):
            return render_template('contact.html', name=detail.name)
    return render_template('contact.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'userid' in session and session['userid'] in Admin.query.filter_by(userid=session['userid']).first().userid:
        detail = Admin.query.filter_by(userid=session['userid']).first()
        if pwd_context.verify(session['password'], detail.password):
            return redirect('/dashboard')

    if request.method == 'POST':
        userid = request.form.get('email')
        passwd = request.form.get('pass')
        detail = Admin.query.filter_by(userid=userid).first()
        if detail and userid in detail.userid and pwd_context.verify(passwd, detail.password):
            session['userid'] = userid
            session['password'] = passwd
            return redirect('/dashboard')
        else:
            flash('Invalid Credentials')
    return render_template('login.html')


@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if 'userid' in session and session['userid'] in Admin.query.filter_by(userid=session['userid']).first().userid:
        detail = Admin.query.filter_by(userid=session['userid']).first()
        if pwd_context.verify(session['password'], detail.password):
            posts = Post.query.filter_by(author=detail.userid).all()
            return render_template('dashboard.html', posts=posts, name=detail.name)
        else:
            return redirect('/login')
    else:
        return redirect('/login')


@app.route("/logout")
def logout():
    session.pop('userid')
    session.pop('password')
    return render_template('login.html')


@app.route('/edit/<string:post_id>')
def edit(post_id):
    if 'userid' in session and session['userid'] == Admin.query.filter_by(userid=session['userid']).one().userid:
        detail = Admin.query.filter_by(userid=session['userid']).one()
        if post_id == '0':
            categories = Category.query.order_by(Category.name).all()
            post = types.SimpleNamespace()
            post.id = 'NEW'
            post.title = ''
            post.excerpt = ''
            post.content = ''
            post.photo = ''
            return render_template('edit.html', post=post, state='Add', name=detail.name, categories=categories,
                                   selected='')
        # if 'email' in session and len(Admin.query.filter_by(email=session['email'])):

        else:
            categories = Category.query.order_by(Category.name).all()
            post = Post.query.filter_by(pid=post_id).first()
            return render_template('edit.html', post=post, state='Edit', name=detail.name, categories=categories,
                                   selected=post.category)


@app.route('/sender', methods=['POST'])
def sender():
    if 'userid' in session and session['userid'] == Admin.query.filter_by(userid=session['userid']).one().userid:
        detail = Admin.query.filter_by(userid=session['userid']).one()
        if request.method == 'POST':
            author = detail.userid
            pid = request.form.get('id')
            title = request.form.get('title')
            category = request.form.get('category')
            excerpt = request.form.get('excerpt')
            slug = request.form.get('title').replace(" ", "-")
            content = request.form.get('content')
            # img_file = request.form.get('img_file')
            # img_file = base64.b64encode(img_file)
            if id == 'New':
                post = Post(title=title, author=author, category=category, slug=slug, content=content, excerpt=excerpt,
                            )
                db.session.add(post)
                db.session.commit()
                return redirect('/dashboard', flash('Post Saved.'))
            else:
                post = Post.query.filter_by(pid=id).first()
                post.title = title
                post.category = category
                post.excerpt = excerpt
                post.slug = slug
                post.content = content
                db.session.add(post)
                db.session.commit()
                return redirect('/dashboard', flash('Post Updated.'))
        else:
            return redirect('/login')

@app.route('/article/<string:slug>', methods=['GET'])
def article(slug):
    if 'userid' in session and session['userid'] == Admin.query.filter_by(userid=session['userid']).one().userid:
        detail = Admin.query.filter_by(userid=session['userid']).one()
        post = Post.query.filter_by(slug=slug).one()
        if post:
            auther = Admin.query.filter_by(userid=post.userid).one()
            render_template('single.html', name=detail.name, post=post, auther=auther)


@app.route('/addcategory', methods=['GET', 'POST'])
def addCategory():
    op = request.args.get('op')
    data = {}

    if op == 'searchcat':
        catname = request.args.get('catname')
        if catname == '':
            data = {'result': 'error'}
            return json.dumps(data)
        cat = Category.query.filter_by(name=catname).first()
        if cat:
            data = {'result': 'error'}
        else:
            data = {'result': 'ok'}

    if op == 'searchslug':
        catslug = request.args.get('catslug')
        if catslug == '':
            data = {'result': 'error'}
            return json.dumps(data)
        cat = Category.query.filter_by(slug=catslug).first()
        if cat:
            data = {'result': 'error'}
        else:
            data = {'result': 'ok'}

    if op == 'add':
        catname = request.args.get('catname')
        catslug = request.args.get('catslug')
        cat = Category(name=catname, slug=catslug)
        db.session.add(cat)
        db.session.commit()
        data = {'result': 'category added'}

    return json.dumps(data)

@app.route('/message', methods=['POST'])
def message():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        subject = request.form['subject']
        content = request.form['message']
        message = Message(name=name, email=email, subject=subject, content=content)
        db.session.add(message)
        db.session.commit()
        return json.dumps({'success': True})


if __name__ == '__main__':
    app.run(debug=True)
