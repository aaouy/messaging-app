# Generated by Django 5.1.6 on 2025-05-07 01:47

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mssg_app', '0016_alter_messageimages_message'),
    ]

    operations = [
        migrations.AlterField(
            model_name='messages',
            name='sender',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to=settings.AUTH_USER_MODEL),
        ),
    ]
