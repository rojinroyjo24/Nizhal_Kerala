from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from places.models import Place

User = get_user_model()

SAMPLE_PLACES = [
    {
        'title': 'Meenmutty Waterfalls – Wayanad\'s Hidden Giant',
        'description': 'A magnificent three-tiered waterfall hidden deep in the Wayanad forests. The trek to reach this 300-meter waterfall passes through dense tropical jungle, stream crossings, and breathtaking viewpoints. Best visited between June and December when the falls are at their fullest. The trail requires moderate fitness and takes about 3 hours round trip.',
        'district': 'Wayanad',
        'category': 'Waterfall',
        'difficulty': 'Moderate',
        'best_season': 'Monsoon',
        'image': 'https://images.unsplash.com/photo-1547751574-d23b2699caf6?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Meenmutty+Waterfalls+Wayanad',
    },
    {
        'title': 'Chembra Peak – The Heart-Shaped Lake',
        'description': 'The highest peak in Wayanad district at 2100m above sea level, famous for the heart-shaped lake near the summit that never dries up. The trek offers panoramic views of the Western Ghats and on clear days you can see the Nilgiri hills. A permit is required from the Forest Department.',
        'district': 'Wayanad',
        'category': 'Trekking',
        'difficulty': 'Hard',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Chembra+Peak+Wayanad',
    },
    {
        'title': 'Athirappilly – Queen of Kerala Waterfalls',
        'description': 'The largest waterfall in Kerala, cascading 80 feet from the Sholayar ranges. Known as the "Niagara of India", this thundering waterfall is surrounded by pristine Vazhachal forest. The area is home to the endangered hornbill and elephants.',
        'district': 'Thrissur',
        'category': 'Waterfall',
        'difficulty': 'Easy',
        'best_season': 'Monsoon',
        'image': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Athirappilly+Waterfalls',
    },
    {
        'title': 'Ponmudi Hill Station – Thiruvananthapuram\'s Secret',
        'description': 'A misty hill station at 1100m elevation, just 61km from Thiruvananthapuram city. The winding ghat road with 22 hairpin bends offers stunning views. The summit is often shrouded in clouds, creating a mystical atmosphere.',
        'district': 'Thiruvananthapuram',
        'category': 'Viewpoint',
        'difficulty': 'Easy',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Ponmudi+Hill+Station',
    },
    {
        'title': 'Kappad Beach – Where Vasco da Gama Landed',
        'description': 'A historic beach where Portuguese explorer Vasco da Gama first landed in India in 1498. A stone monument marks this historic spot. The beach is relatively untouched compared to popular Kozhikode beaches.',
        'district': 'Kozhikode',
        'category': 'Beach',
        'difficulty': 'Easy',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Kappad+Beach+Kozhikode',
    },
    {
        'title': 'Munroe Island – Kerala\'s Backwater Village',
        'description': 'A cluster of eight small islands at the confluence of Ashtamudi Lake and Kallada River. Traditional Kerala village life is perfectly preserved here — watch as locals fish using traditional methods and canoe through narrow backwater canals.',
        'district': 'Kollam',
        'category': 'Village',
        'difficulty': 'Easy',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1579983219921-9890f9da5af4?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Munroe+Island+Kollam',
    },
    {
        'title': 'Silent Valley National Park',
        'description': 'One of India\'s last undisturbed tropical rainforests, home to the endangered lion-tailed macaque. The park contains over 1000 species of flowering plants and rare birds. Absolutely silent except for bird calls.',
        'district': 'Palakkad',
        'category': 'Forest',
        'difficulty': 'Hard',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1511497584788-876761c119ef?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Silent+Valley+National+Park',
    },
    {
        'title': 'Cheeyappara Waterfalls – Munnar\'s Roadside Wonder',
        'description': 'A series of seven cascading steps waterfall visible right from the Kochi-Madurai highway near Munnar. The surrounding tea estate gardens and cool climate make this a refreshing stop during monsoon season.',
        'district': 'Idukki',
        'category': 'Waterfall',
        'difficulty': 'Easy',
        'best_season': 'Monsoon',
        'image': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Cheeyappara+Waterfalls+Munnar',
    },
    {
        'title': 'Varkala Cliff Beach',
        'description': 'One of Asia\'s few beaches where cliffs run along the seafront. The natural spring water flowing down the laterite cliffs is believed to have healing properties. Sunset views from the cliff are absolutely spectacular.',
        'district': 'Thiruvananthapuram',
        'category': 'Beach',
        'difficulty': 'Easy',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Varkala+Cliff+Beach',
    },
    {
        'title': 'Periyar River Rafting – Senapathy',
        'description': 'An exhilarating white-water rafting experience on the Periyar River near Senapathy, one of Kerala\'s best-kept adventure secrets. The route passes through dense jungle with occasional elephant sightings.',
        'district': 'Idukki',
        'category': 'River',
        'difficulty': 'Moderate',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Periyar+River+Senapathy+Kerala',
    },
    {
        'title': 'Kuttanad Waterways – Rice Bowl Below Sea Level',
        'description': 'Famous as the Rice Bowl of Kerala, Kuttanad is one of the few places in the world where farming is done up to 3 meters below sea level. A shikara boat trip through the heart of Kuttanad gives an intimate glimpse into emerald paddy fields.',
        'district': 'Alappuzha',
        'category': 'Village',
        'difficulty': 'Easy',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Kuttanad+Alappuzha',
    },
    {
        'title': 'Illikkal Kallu – Peak of Three Boulders',
        'description': 'Rising to 4000 feet above sea level, Illikkal Kallu is a majestic rock formation comprising three distinct boulders. The mist-clad valley views and cool mountain breeze make this a favorite among hikers.',
        'district': 'Kottayam',
        'category': 'Trekking',
        'difficulty': 'Hard',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Illikkal+Kallu+Kottayam',
    },
    {
        'title': 'Bhoothathankettu Dam & Forest Reserve',
        'description': 'Mythological folklore says demons built this natural dam overnight to flood the Trikkakara temple. Surrounded by thick green forests and Periyar River backwaters, Bhoothathankettu offers quiet boat safaris.',
        'district': 'Ernakulam',
        'category': 'Forest',
        'difficulty': 'Easy',
        'best_season': 'Year Round',
        'image': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Bhoothathankettu+Dam',
    },
    {
        'title': 'Muzhappilangad Drive-in Beach',
        'description': 'Asia\'s longest drive-in beach stretching nearly 4 kilometers along Malabar coast. Hard sand allows cars and motorbikes to drive right along the water edge. Sunset drives and local seafood shacks make this a unique coastal experience.',
        'district': 'Kannur',
        'category': 'Beach',
        'difficulty': 'Easy',
        'best_season': 'Year Round',
        'image': 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Muzhappilangad+Drive-in+Beach',
    },
    {
        'title': 'Bekal Fort & Coastal Promontory',
        'description': 'The largest fort in Kerala, standing dramatically on a headland overlooking the Arabian Sea. Featuring observation towers, underground tunnels, and well-manicured green lawns, Bekal Fort offers scenic coastal views.',
        'district': 'Kasaragod',
        'category': 'Viewpoint',
        'difficulty': 'Easy',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Bekal+Fort+Kasaragod',
    },
    {
        'title': 'Nilambur Teak Plantation & Canoli Plot',
        'description': 'Home to the world\'s oldest teak plantation planted in 1840 by H.V. Conolly. Features massive teak trees towering over 40 meters tall, an interactive Teak Museum, and hanging bridge across Chaliyar River.',
        'district': 'Malappuram',
        'category': 'Forest',
        'difficulty': 'Easy',
        'best_season': 'Year Round',
        'image': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Conolly+Plot+Nilambur',
    },
    {
        'title': 'Gavi Eco-Tourism Wilderness Trail',
        'description': 'Deep inside Periyar Tiger Reserve, Gavi is an untouched eco-tourism haven. Offers guided canopy walks, cardamom plantation tours, boating in Gavi Lake, and forest night camping under supervision.',
        'district': 'Pathanamthitta',
        'category': 'Forest',
        'difficulty': 'Moderate',
        'best_season': 'Winter',
        'image': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        'google_maps_link': 'https://maps.google.com/?q=Gavi+Pathanamthitta',
    },
]


from reviews.models import Review

class Command(BaseCommand):
    help = 'Seeds the database with sample Kerala places, users, and admin user'

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
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password('Admin@123')
        admin.save()
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Admin created: admin@nizhal.com / Admin@123'))
        else:
            self.stdout.write(self.style.SUCCESS('🔄 Admin password updated: admin@nizhal.com / Admin@123'))

        # ── Create DEMO user ───────────────────────────────────────────────
        demo_user, created = User.objects.get_or_create(
            email='explorer@example.com',
            defaults={
                'username': 'explorer',
                'first_name': 'Kerala',
                'last_name': 'Explorer',
            }
        )
        demo_user.set_password('password123')
        demo_user.save()
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Demo user created: explorer@example.com / password123'))

        # ── Create AMMU user ───────────────────────────────────────────────
        ammu_user, created = User.objects.get_or_create(
            email='ammu@example.com',
            defaults={
                'username': 'Ammu_29',
                'first_name': 'Ammu',
                'last_name': 'User',
            }
        )
        ammu_user.set_password('password123')
        ammu_user.save()
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Ammu user created: Ammu_29 / password123'))

        # ── Create PLACES ──────────────────────────────────────────────────
        created_count = 0
        all_places = []
        for place_data in SAMPLE_PLACES:
            place, created = Place.objects.get_or_create(
                title=place_data['title'],
                defaults={**place_data, 'added_by': demo_user, 'status': 'approved'}
            )
            if 'image' in place_data and (not place.image or str(place.image) != place_data['image']):
                place.image = place_data['image']
                if 'best_season' in place_data and not place.best_season:
                    place.best_season = place_data['best_season']
                place.save()
            all_places.append(place)
            if created:
                created_count += 1
                self.stdout.write(f'  📍 Added: {place.title}')

        # ── Create SAMPLE REVIEWS ──────────────────────────────────────────
        if all_places:
            Review.objects.get_or_create(
                place=all_places[0],
                user=ammu_user,
                defaults={'rating': 5, 'comment': 'Breathtaking experience! Highly recommended for trekkers and nature lovers.'}
            )
            Review.objects.get_or_create(
                place=all_places[1],
                user=demo_user,
                defaults={'rating': 5, 'comment': 'The heart-shaped lake is absolutely stunning. Unforgettable views!'}
            )

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Seeding complete! {created_count} places ready.'
        ))
        self.stdout.write('\n' + '─' * 55)
        self.stdout.write('🛡️  ADMIN ACCOUNT → Email: admin@nizhal.com  | Pass: Admin@123')
        self.stdout.write('👤  EXPLORER ACCOUNT → Username: explorer | Pass: password123')
        self.stdout.write('👤  AMMU ACCOUNT → Username: Ammu_29 | Pass: password123')
        self.stdout.write('─' * 55)
