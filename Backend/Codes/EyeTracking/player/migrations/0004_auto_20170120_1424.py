# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-01-20 13:24
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0003_auto_20170120_1353'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='image_url',
            field=models.URLField(default=0),
        ),
        migrations.AddField(
            model_name='video',
            name='youtube_id',
            field=models.CharField(default='5PST7Ld4wWU', max_length=50),
            preserve_default=False,
        ),
    ]
