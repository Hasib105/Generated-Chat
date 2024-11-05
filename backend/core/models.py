from mongoengine import Document, StringField, ReferenceField, DateTimeField, ListField, BooleanField, ValidationError, EmailField
from datetime import datetime
from django.utils.text import slugify
from django.contrib.auth.hashers import make_password



class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)  
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.username

    def clean(self):
        if len(self.password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")

    def save(self, *args, **kwargs):
        if self.password:
            self.password = make_password(self.password)  
        super(User, self).save(*args, **kwargs)

class ChatThread(Document):
    title = StringField(max_length=100)
    user = ReferenceField(User, null=True, reverse_delete_rule=4)  
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.title

class ChatMessage(Document):
    thread = ReferenceField(ChatThread, reverse_delete_rule=4) 
    user = ReferenceField(User, null=True, reverse_delete_rule=4)  
    message = StringField()  
    response = StringField()  
    timestamp = DateTimeField(default=datetime.utcnow)
    slug = StringField(blank=True, null=True, unique=True)  

    def save(self, *args, **kwargs):
        if self.message: 
            self.slug = self._generate_unique_slug()
        super(ChatMessage, self).save(*args, **kwargs)

    def _generate_unique_slug(self):
        unique_slug = slugify(self.message)
        count = 1
        while ChatMessage.objects(slug=unique_slug).first():
            unique_slug = f"{slugify(self.message)}-{count}"
            count += 1
        return unique_slug

    meta = {
        'ordering': ['-timestamp'],
        'indexes': [
            {'fields': ['slug'], 'unique': True}  
        ]
    }

    def __str__(self):
        return self.slug