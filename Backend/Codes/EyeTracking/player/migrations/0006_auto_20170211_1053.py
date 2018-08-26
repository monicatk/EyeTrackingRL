# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-11 10:53
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0005_auto_20170131_0043'),
    ]

    operations = [
        migrations.CreateModel(
            name='UsersSim',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('User1Id', models.IntegerField()),
                ('User2Id', models.IntegerField()),
                ('Sim', models.IntegerField()),
            ],
        ),
        migrations.AddField(
            model_name='userhistory',
            name='Rating',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='userssim',
            unique_together=set([('User1Id', 'User2Id')]),
        ),
    ]
