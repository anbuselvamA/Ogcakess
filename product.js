import { db } from './firebase-config.js';
import {
  doc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Fade in the document
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);

  const urlParams = new URLSearchParams(window.location.search);
  const cakeId = urlParams.get('id');

  const skelView = document.getElementById('skel-view');
  const productView = document.getElementById('product-view');

  if (!cakeId) {
    skelView.innerHTML = '<p style="padding: 40px; text-align:center;">Product not found.</p>';
    window.location.href = 'index.html'; // Fallback
    return;
  }

  try {
    const docRef = doc(db, 'cakes', cakeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cake = docSnap.data();

      // Populate UI
      document.getElementById('p-name').textContent = cake.name;
      
      const price = Number(cake.price).toLocaleString('en-IN');
      document.getElementById('p-price').textContent = `₹${price}`;
      
      if (cake.description) {
        document.getElementById('p-desc').textContent = cake.description;
      }

      if (cake.imageUrl) {
        document.getElementById('p-img').src = cake.imageUrl;
      } else {
        document.getElementById('p-img').style.display = 'none'; // Better layout if no image
      }
      
      if (cake.rating) {
        document.getElementById('p-rating').textContent = `⭐ ${cake.rating} | Best Seller`;
      }

      // Configure WhatsApp Button
      const waBtn = document.getElementById('btn-wa');
      waBtn.addEventListener('click', () => {
        const text = encodeURIComponent(`Hi Zia Cakes! I would like to order the ${cake.name} (₹${price}).`);
        window.open(`https://wa.me/918778077747?text=${text}`, '_blank');
      });

      // Show View
      skelView.style.display = 'none';
      productView.style.display = 'block';

    } else {
      skelView.innerHTML = '<p style="padding: 40px; text-align:center;">This cake is no longer available.</p>';
    }
  } catch (error) {
    console.error("Error fetching cake data:", error);
    skelView.innerHTML = '<p style="padding: 40px; text-align:center;">Connection error loading product details.</p>';
  }
});
