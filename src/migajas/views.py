from rest_framework import viewsets, views
from rest_framework.response import Response
from django.db.models import Sum
from .models import Interaction
from .serializers import InteractionSerializer

class InteractionViewSet(viewsets.ModelViewSet):
    queryset = Interaction.objects.all().order_by('-created_at')
    serializer_class = InteractionSerializer

    def perform_create(self, serializer):
        # 1. Get current actual total from DB
        current_sum = Interaction.objects.aggregate(Sum('crumbs'))['crumbs__sum'] or 0
        
        # 2. Effective Start: What the user *sees* and *thinks* is the total.
        #    (Clamped between 0 and 80,000)
        effective_start = min(80000, max(0, current_sum))
        
        # 3. Calculate Intended Delta based on standard rules
        #    We create a temporary instance to use the model's logic
        temp_instance = Interaction(**serializer.validated_data)
        intended_delta = temp_instance.calculate_crumbs()
        
        # 4. Target End: Where the user expects to end up
        target_end = effective_start + intended_delta
        
        # 5. Clamp Target: Enforce the strict [0, 80000] bound
        #    "Never let the database have a bigger number" logic applied here.
        target_end = min(80000, max(0, target_end))
        
        # 6. Required Real Delta: The actual change needed in the DB to match the target
        #    This automatically handles "correcting" a previously overflowed DB.
        #    Example: DB=150k, User adds -1k. Effective=80k. Target=79k. Required=79k-150k = -71k.
        required_delta = target_end - current_sum
        
        # 7. Save with explicit crumbs
        serializer.save(crumbs=required_delta)

class StatsView(views.APIView):
    def get(self, request):
        total_crumbs = Interaction.objects.aggregate(Sum('crumbs'))['crumbs__sum'] or 0
        # Limit total to 80,000 (Bread Goal) and ensure non-negative
        total_crumbs = min(80000, max(0, total_crumbs))
        GOAL = 80000
        
        return Response({
            'total_crumbs': total_crumbs,
            'goal': GOAL,
            'percent': (total_crumbs / GOAL) * 100
        })
