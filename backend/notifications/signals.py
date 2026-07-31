from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender='places.Place')
def notify_place_status_change(sender, instance, created, **kwargs):
    """Notify owner when their place is approved or rejected."""
    if created:
        return  # skip notification on initial creation

    try:
        from notifications.models import Notification
        if instance.status == 'approved':
            Notification.objects.get_or_create(
                recipient=instance.added_by,
                notification_type='place_approved',
                related_place=instance,
                defaults={
                    'title': 'Your place has been approved! 🎉',
                    'message': f'"{instance.title}" is now live and visible to explorers.',
                }
            )
        elif instance.status == 'rejected':
            note = f' Reason: {instance.admin_note}' if instance.admin_note else ''
            Notification.objects.get_or_create(
                recipient=instance.added_by,
                notification_type='place_rejected',
                related_place=instance,
                defaults={
                    'title': 'Your place was not approved',
                    'message': f'"{instance.title}" was not approved.{note}',
                }
            )
    except Exception:
        pass
