# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-17 12:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0015_auto_20170417_1110'),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoAverages',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('VideoId', models.CharField(max_length=50)),
                ('Count', models.IntegerField()),
                ('AvgFixDur', models.FloatField()),
                ('AvgFixCount', models.FloatField()),
            ],
        ),
        migrations.RemoveField(
            model_name='youtubevideo',
            name='avg_fix_count',
        ),
        migrations.RemoveField(
            model_name='youtubevideo',
            name='avg_fix_dur',
        ),
    ]
