from django.db import models

class Interaction(models.Model):
    INTERACTION_TYPES = [
        ('CONVERSATION', 'Conversation'),
        ('CALL', 'Call'),
        ('REMOVAL', 'Removal'),
    ]

    type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    # count_or_duration means:
    # - messages count if type is CONVERSATION
    # - minutes duration if type is CALL
    # - crumbs to remove if type is REMOVAL
    count_or_duration = models.IntegerField()
    crumbs = models.IntegerField(editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.crumbs is None:
            self.crumbs = self.calculate_crumbs()
        super().save(*args, **kwargs)

    def calculate_crumbs(self):
        if self.type == 'REMOVAL':
            # "Remove crumbs" -> return negative value of count
            return -abs(self.count_or_duration)

        if self.type == 'CONVERSATION':
            # >= 5 messages = 1 crumb.
            if self.count_or_duration >= 5:
                return 1
            return 0
        elif self.type == 'CALL':
            # >= 5 minutes = 5 crumbs.
            # "de lo contrario es solo una" (otherwise it's just one)
            if self.count_or_duration >= 5:
                return 5
            else:
                return 1
        return 0

    def __str__(self):
        return f"{self.type} - {self.crumbs} crumbs"
