import { db } from './firebase-config.js';
import {
  doc, getDoc, collection, getDocs, query, limit
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Fade in the document
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);

  const urlParams = new URLSearchParams(window.location.search);
  const cakeId = urlParams.get('id');

  const skelView = document.getElementById('skel-view');
  const productView = document.getElementById('product-view');

  if (!cakeId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    // 1. Fetch Main Product
    const docRef = doc(db, 'cakes', cakeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cake = docSnap.data();

      // Populate UI
      document.getElementById('p-name').textContent = cake.name;
      
      const price = Number(cake.price).toLocaleString('en-IN');
      document.getElementById('p-price').textContent = `₹${price}`;
      // Hero overlay text (name + price shown directly on the image)
      const heroPrice = document.getElementById('p-price-hero');
      if (heroPrice) heroPrice.textContent = `₹${price}`;
      
      if (cake.description) {
        document.getElementById('p-desc').textContent = cake.description;
      }

      const imgEl = document.getElementById('p-img');
      if (cake.imageUrl && cake.imageUrl.length > 10) {
        imgEl.src = cake.imageUrl;
        imgEl.onerror = () => {
          // Image failed to load — show a beautiful gradient placeholder
          imgEl.style.display = 'none';
          const heroContainer = document.querySelector('.hero-container');
          heroContainer.style.background = 'linear-gradient(160deg, #3D1F0D 0%, #1A120B 50%, #2C1A0E 100%)';
          const placeholder = document.createElement('div');
          placeholder.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:5rem;z-index:2;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.5));';
          placeholder.textContent = '🎂';
          heroContainer.appendChild(placeholder);
        };
      } else {
        imgEl.style.display = 'none';
        document.querySelector('.hero-container').style.background = 'linear-gradient(160deg, #3D1F0D 0%, #1A120B 50%, #2C1A0E 100%)';
      }
      
      // Order Button Logic -> Redirect to Form
      const orderBtn = document.getElementById('btn-order');
      orderBtn.addEventListener('click', () => {
        orderBtn.style.transform = 'scale(0.95)'; // Visual tap
        sessionStorage.setItem('pendingOrderName', cake.name);
        sessionStorage.setItem('pendingOrderPrice', price);
        window.location.href = 'index.html#order-form';
      });

      // 2. Fetch "Similar Products"
      loadSimilarProducts(cakeId, cake.category || 'all');

      // Show View
      setTimeout(() => {
        skelView.style.display = 'none';
        productView.style.display = 'block';
      }, 300);

    } else {
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error("Error fetching cake:", error);
    window.location.href = 'index.html';
  }
});

async function loadSimilarProducts(currentCakeId, category) {
  const track = document.getElementById('similar-track');
  try {
    // Fetch a few cakes to show in the carousel
    const q = query(collection(db, 'cakes'), limit(8));
    const querySnapshot = await getDocs(q);
    
    let similarCakes = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.id !== currentCakeId) {
        similarCakes.push({ id: docSnap.id, ...docSnap.data() });
      }
    });

    // Shuffle for randomness if we have enough
    similarCakes.sort(() => 0.5 - Math.random());
    similarCakes = similarCakes.slice(0, 5); // Keep up to 5

    if (similarCakes.length === 0) {
      document.querySelector('.similar-section').style.display = 'none';
      return;
    }

    let html = '';
    for (const sc of similarCakes) {
      const price = Number(sc.price).toLocaleString('en-IN');
      const img = sc.imageUrl && sc.imageUrl.length > 5 ? sc.imageUrl : '';
      
      html += `
        <article class="similar-card" data-id="${sc.id}">
          <img src="${img}" class="scard-img" alt="${sc.name}" loading="lazy" onerror="this.style.display='none'"/>
          <div class="scard-body">
            <h4 class="scard-name">${sc.name}</h4>
            <div class="scard-price">₹${price}</div>
            <span class="scard-tag">Best Seller</span>
          </div>
        </article>
      `;
    }
    
    track.innerHTML = html;

    // Add click listeners to carousel cards
    track.querySelectorAll('.similar-card').forEach(card => {
      card.addEventListener('click', () => {
        document.body.style.opacity = '0'; // fade out
        setTimeout(() => {
          window.location.href = `product.html?id=${card.dataset.id}`;
        }, 200);
      });
    });

  } catch (err) {
    console.error("Error loading similar caching", err);
    document.querySelector('.similar-section').style.display = 'none';
  }
}
