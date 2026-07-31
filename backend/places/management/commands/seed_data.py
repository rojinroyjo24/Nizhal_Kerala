from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from places.models import Place

User = get_user_model()

SAMPLE_PLACES = [
    {
        'title': 'Meenmutty Waterfalls – Wayanad\'s Hidden Giant',
        'description': 'A magnificent three-tiered waterfall hidden deep in the Wayanad forests. The trek to reach this 300-meter waterfall passes through dense tropical jungle, stream crossings, and breathtaking viewpoints. Best visited between June and December when the falls are at their fullest. The trail requires moderate fitness and takes about 3 hours round trip. Carry water, snacks, and wear appropriate trekking shoes.',
        'district': 'Wayanad',
        'category': 'Waterfall',
        'difficulty': 'Moderate',
        'google_maps_link': 'https://maps.google.com/?q=Meenmutty+Waterfalls+Wayanad',
    },
    {
        'title': 'Chembra Peak – The Heart-Shaped Lake',
        'description': 'The highest peak in Wayanad district at 2100m above sea level, famous for the heart-shaped lake near the summit that never dries up. The trek offers panoramic views of the Western Ghats and on clear days you can see the Nilgiri hills. A permit is required from the Forest Department. Best time to visit is from October to March to avoid monsoon rains and leeches.',
        'district': 'Wayanad',
        'category': 'Trekking',
        'difficulty': 'Hard',
        'google_maps_link': 'https://maps.google.com/?q=Chembra+Peak+Wayanad',
    },
    {
        'title': 'Athirappilly – Queen of Kerala Waterfalls',
        'description': 'The largest waterfall in Kerala, cascading 80 feet from the Sholayar ranges. Known as the "Niagara of India", this thundering waterfall is surrounded by pristine Vazhachal forest. The area is home to the endangered hornbill and elephants. Several Bollywood and Malayalam films have been shot here. A pleasant walking trail follows the river downstream through the rainforest.',
        'district': 'Thrissur',
        'category': 'Waterfall',
        'difficulty': 'Easy',
        'google_maps_link': 'https://maps.google.com/?q=Athirappilly+Waterfalls',
    },
    {
        'title': 'Ponmudi Hill Station – Thiruvananthapuram\'s Secret',
        'description': 'A misty hill station at 1100m elevation, just 61km from Thiruvananthapuram city. The winding ghat road with 22 hairpin bends offers stunning views. The summit is often shrouded in clouds, creating a mystical atmosphere. The area has rich biodiversity including several endemic species of birds. A deer park and trekking trails make this a perfect day trip from the capital.',
        'district': 'Thiruvananthapuram',
        'category': 'Viewpoint',
        'difficulty': 'Easy',
        'google_maps_link': 'https://maps.google.com/?q=Ponmudi+Hill+Station',
    },
    {
        'title': 'Kappad Beach – Where Vasco da Gama Landed',
        'description': 'A historic beach where Portuguese explorer Vasco da Gama first landed in India in 1498. A stone monument marks this historic spot. The beach is relatively untouched compared to popular Kozhikode beaches, with rocky outcrops and a small rocky island offshore. The Kappakadavu temple adjacent to the beach is also worth visiting. Best for history enthusiasts and peaceful sunset watching.',
        'district': 'Kozhikode',
        'category': 'Beach',
        'difficulty': 'Easy',
        'google_maps_link': 'https://maps.google.com/?q=Kappad+Beach+Kozhikode',
    },
    {
        'title': 'Munroe Island – Kerala\'s Backwater Village',
        'description': 'A cluster of eight small islands at the confluence of Ashtamudi Lake and Kallada River. Traditional Kerala village life is perfectly preserved here — watch as locals fish using traditional methods, walk along narrow pathways between paddy fields, and visit small churches centuries old. Canoe rides through narrow canals between the islands are a highlight. Far less crowded than Alleppey.',
        'district': 'Kollam',
        'category': 'Village',
        'difficulty': 'Easy',
        'google_maps_link': 'https://maps.google.com/?q=Munroe+Island+Kollam',
    },
    {
        'title': 'Silent Valley National Park',
        'description': 'One of India\'s last undisturbed tropical rainforests, home to the endangered lion-tailed macaque. The park contains over 1000 species of flowering plants, 400 species of butterflies, and rare birds. Entry requires a permit from the Forest Department. The Kuntipuzha River flows through the park, and a guided trek into the valley is an unforgettable experience. Absolutely silent except for bird calls.',
        'district': 'Palakkad',
        'category': 'Forest',
        'difficulty': 'Hard',
        'google_maps_link': 'https://maps.google.com/?q=Silent+Valley+National+Park',
    },
    {
        'title': 'Cheeyappara Waterfalls – Munnar\'s Roadside Wonder',
        'description': 'A series of seven cascading steps waterfall visible right from the Kochi-Madurai highway near Munnar. While technically accessible from the road, the true beauty is experienced by climbing down to the base. The surrounding tea estate gardens and cool climate make this a refreshing stop. The falls are most spectacular during monsoon season. A small chai shop nearby serves excellent cardamom tea.',
        'district': 'Idukki',
        'category': 'Waterfall',
        'difficulty': 'Easy',
        'google_maps_link': 'https://maps.google.com/?q=Cheeyappara+Waterfalls+Munnar',
    },
    {
        'title': 'Varkala Cliff Beach',
        'description': 'One of Asia\'s few beaches where cliffs run along the seafront. The natural spring water flowing down the laterite cliffs is believed to have healing properties. The clifftop promenade is lined with yoga centers, cafes, and shops. The beach below (North Cliff) is relatively less crowded than the main beach. Sunset views from the cliff are absolutely spectacular. Best between November and March.',
        'district': 'Thiruvananthapuram',
        'category': 'Beach',
        'difficulty': 'Easy',
        'google_maps_link': 'https://maps.google.com/?q=Varkala+Cliff+Beach',
    },
    {
        'title': 'Periyar River Rafting – Senapathy',
        'description': 'An exhilarating white-water rafting experience on the Periyar River near Senapathy, one of Kerala\'s best-kept adventure secrets. The route passes through dense jungle with occasional elephant sightings. The rapids range from Grade 2 to Grade 4, suitable for both beginners and experienced rafters. The Kerala Adventure Tourism department organizes safe, guided trips. The dry season from October to May is best.',
        'district': 'Idukki',
        'category': 'River',
        'difficulty': 'Moderate',
        'google_maps_link': 'https://maps.google.com/?q=Periyar+River+Senapathy+Kerala',
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with sample Kerala places, a demo user, and an admin user'

    def handle(self, *args, **options):
        self.stdout.write('🌿 Seeding Hidden Kerala database...')

        # ── Create ADMIN user ──────────────────────────────────────────────
        admin, created = User.objects.get_or_create(
            email='admin@nizhal.com',
            defaults={
                'username': 'nizhal_admin',
                'first_name': 'Nizhal',
                'last_name': 'Admin',
            }
        )
        # Always force-set staff, superuser, and password
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password('Admin@123')
        admin.save()
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Admin created: admin@nizhal.com / Admin@123'))
        else:
            self.stdout.write(self.style.SUCCESS('🔄 Admin password reset: admin@nizhal.com / Admin@123'))

        # ── Create DEMO user ───────────────────────────────────────────────
        demo_user, created = User.objects.get_or_create(
            email='explorer@example.com',
            defaults={
                'username': 'explorer',
                'first_name': 'Kerala',
                'last_name': 'Explorer',
            }
        )
        if created:
            demo_user.set_password('password123')
            demo_user.save()
            self.stdout.write(self.style.SUCCESS('✅ Demo user created: explorer@example.com / password123'))
        else:
            self.stdout.write('ℹ️  Demo user already exists')

        # ── Create PLACES ──────────────────────────────────────────────────
        created_count = 0
        for place_data in SAMPLE_PLACES:
            place, created = Place.objects.get_or_create(
                title=place_data['title'],
                defaults={**place_data, 'added_by': demo_user, 'status': 'approved'}
            )
            if created:
                created_count += 1
                self.stdout.write(f'  📍 Added: {place.title}')

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Seeding complete! {created_count} new places added.'
        ))
        self.stdout.write('\n' + '─' * 50)
        self.stdout.write('🛡️  ADMIN LOGIN  → admin@nizhal.com  / Admin@123')
        self.stdout.write('👤  USER LOGIN   → explorer@example.com / password123')
        self.stdout.write('─' * 50)
