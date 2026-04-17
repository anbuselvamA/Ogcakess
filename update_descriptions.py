import os
file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'A velvety indulgence adorned with bespoke artisanal frosting.': 'Soft cake with sweet cream frosting. Perfect for your family function!',
    'Delicate layers infused with pure gold and rich cream.': 'Tasty cream layers with real gold. Makes wedding functions extra grand!',
    'A feather-light masterpiece crafted with artisanal vanilla bean.': 'Very soft and light vanilla cake. An everyday favorite for the house.',
    'Handpicked organic strawberries enveloped in soft mascarpone cream.': 'Sweet strawberry cake with fresh cream. Kids always ask for this flavor!',
    'A fragrant, botanical sensation designed for luxury palates.': 'Beautiful sweet floral cake. Gives a grand look for birthday party photos!',
    'Dark cocoa perfection enrobed in a smooth matte finish.': 'Smooth dark chocolate cake. The perfect surprise gift for true chocolate lovers.',
    'Artisanal chocolate shards on top of rich dark ganache.': 'Thick chocolate cake topped with sweet pieces. A super hit for birthdays.',
    'Stunning cocoa mirror glaze adorned with 24k gold leaf.': 'Shiny chocolate cake decorated with gold. Very special for first wedding anniversaries!',
    'A stunning personalized creation reflecting modern culinary artistry.': 'Tell us your design idea! We will bake a beautiful custom cake.'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
