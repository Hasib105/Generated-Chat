from mongoengine import Document, StringField, ReferenceField, DateTimeField, ListField, BooleanField, ValidationError, EmailField,IntField
from datetime import datetime
from django.utils.text import slugify
from django.contrib.auth.hashers import make_password
from django.db.models.signals import post_save
from django.dispatch import receiver


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

    @property
    def is_authenticated(self):
        return True  

class Settings(Document):
    model_choices = [
        ('gemma-7b-it', 'Gemma 7B IT'),
        ('gemma2-9b-it', 'Gemma 2 9B IT'),
        ('llama-3.1-70b-versatile', 'Llama 3.1 70B Versatile'),
        ('llama-3.1-8b-instant', 'Llama 3.1 8B Instant'),
        ('llama-3.2-11b-text-preview', 'Llama 3.2 11B Text Preview'),
        ('llama-3.2-11b-vision-preview', 'Llama 3.2 11B Vision Preview'),
        ('llama-3.2-1b-preview', 'Llama 3.2 1B Preview'),
        ('llama-3.2-3b-preview', 'Llama 3.2 3B Preview'),
        ('llama-3.2-90b-text-preview', 'Llama 3.2 90B Text Preview'),
        ('llama-guard-3-8b', 'Llama Guard 3 8B'),
        ('llama3-8b-8192', 'Llama 3 8B 8192')
    ]
    user = ReferenceField(User, required=True, unique=True, reverse_delete_rule=4)  
    model = StringField(max_length=100, choices=model_choices, default='llama3-8b-8192')
    max_tokens = IntField(default=200)
    customize_response = StringField(default="You are an intelligent assistant. Please provide informative and helpful responses.")

    def __str__(self):
        return f"Settings for {self.user.username}"

    meta = {
        'indexes': [
            {'fields': ['user'], 'unique': True}  # Ensure unique user reference
        ]
    }

class ChatThread(Document):
    title = StringField(max_length=100)
    slug = StringField(blank=True, null=True, unique=True)
    user = ReferenceField(User, null=True, reverse_delete_rule=4)
    created_at = DateTimeField(default=datetime.utcnow)

    def save(self, *args, **kwargs):
        if self.title and not self.slug:
            self.slug = self._generate_slug()
        super(ChatThread, self).save(*args, **kwargs)

    def _generate_slug(self):
        base_slug = slugify(self.title)
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')  # Format as YYYYMMDDHHMMSS
        unique_slug = f"{base_slug}-{timestamp}"
        return unique_slug

    meta = {
        'ordering': ['-created_at'],
        'indexes': [
            {'fields': ['slug'], 'unique': True}
        ]
    }



class ChatMessage(Document):
    thread = ReferenceField(ChatThread, reverse_delete_rule=4)
    user = ReferenceField(User, null=True, reverse_delete_rule=4)
    message = StringField()
    response = StringField()
    timestamp = DateTimeField(default=datetime.utcnow)
    slug = StringField(blank=True, null=True, unique=True)

    def save(self, *args, **kwargs):
        if self.message and not self.slug:  
            self.slug = self._generate_slug()
        super(ChatMessage, self).save(*args, **kwargs)

    def _generate_slug(self):
        base_slug = slugify(self.message[:30])  # Use the first 30 characters of the message for the slug
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')  # Format as YYYYMMDDHHMMSS
        unique_slug = f"{base_slug}-{timestamp}"
        return unique_slug

    meta = {
        'ordering': ['timestamp'],
        'indexes': [
            {'fields': ['slug'], 'unique': True}
        ]
    }

    def __str__(self):
        return self.slug


