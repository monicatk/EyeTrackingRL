# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-15 17:10
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0012_auto_20170408_0050'),
    ]

    operations = [
        migrations.CreateModel(
            name='UsersVideoSim',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('User1Id', models.IntegerField()),
                ('User2Id', models.IntegerField()),
                ('VideoId', models.CharField(max_length=50)),
                ('Sim', models.IntegerField()),
            ],
        ),
        migrations.RemoveField(
            model_name='fixationpoints',
            name='Duration',
        ),
        migrations.AddField(
            model_name='fixationpoints',
            name='StopTime',
            field=models.FloatField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='fixationpoints',
            name='PosX',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='fixationpoints',
            name='PosY',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='fixationpoints',
            name='StartTime',
            field=models.FloatField(),
        ),
        migrations.AlterUniqueTogether(
            name='usersvideosim',
            unique_together=set([('User1Id', 'User2Id', 'VideoId')]),
        ),
    ]
