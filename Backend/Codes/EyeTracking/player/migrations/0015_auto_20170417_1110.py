# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-17 09:10
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0014_auto_20170415_2032'),
    ]

    operations = [
        migrations.AddField(
            model_name='youtubevideo',
            name='avg_fix_count',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='youtubevideo',
            name='avg_fix_dur',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]