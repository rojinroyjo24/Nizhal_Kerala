from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('places', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending Review'),
                    ('approved', 'Approved'),
                    ('rejected', 'Rejected'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='place',
            name='admin_note',
            field=models.TextField(blank=True, help_text='Internal note for approval/rejection reason'),
        ),
    ]
