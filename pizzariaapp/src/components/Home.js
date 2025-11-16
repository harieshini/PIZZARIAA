import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <h1 className="hero-title">Our Story</h1>

      <section className="story-section">
        <p className="story-text">
          We believe in good. We launched Fresh Pan Pizza Best Excuse Awards on our Facebook fan page. 
          Fans were given situations where they had to come up with wacky and fun excuses. The person with 
          the best excuse won the Best Excuse Badge and won Pizzeria's vouchers. Their enthusiastic response 
          proved that Pizzeria's Fresh Pan Pizza is the Tastiest Pan Pizza. Ever!
        </p>
        <p className="story-text">
          Ever since we launched the Tastiest Pan Pizza, ever, people have not been able to resist the softest, 
          cheesiest, crunchiest, butteriest Domino's Fresh Pan Pizza. They have been leaving the stage in the 
          middle of a performance and even finding excuses to be disqualified in a football match.
        </p>
        <p className="story-text">
          We launched Fresh Pan Pizza Best Excuse Awards on our Facebook fan page. Fans were given situations 
          where they had to come up with wacky and fun excuses. The person with the best excuse won the Best 
          Excuse Badge and won Domino's vouchers. Their enthusiastic response proved that Pizzeria's Fresh Pan 
          Pizza is the Tastiest Pan Pizza. Ever!
        </p>
      </section>

      <section className="ingredients-section">
        <div className="ingredients-content">
          <div className="ingredients-image">
            <img 
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop" 
              alt="Pizza Ingredients"
            />
          </div>
          <div className="ingredients-text">
            <h2>Ingredients</h2>
            <p>
              We're ruthless about goodness. We have no qualms about tearing up a day-old lettuce leaf 
              (straight from the farm), or steaming a baby (carrot). Cut. Cut. Chop. Chop. Steam. Steam. 
              Stir Stir. While they're still young and fresh - that's our motto. It makes the kitchen a 
              better place.
            </p>
          </div>
        </div>
      </section>

      <section className="chefs-section">
        <div className="chefs-content">
          <div className="chefs-text">
            <h2>Our Chefs</h2>
            <p>
              They make sauces sing and salads dance. They create magic with skill, knowledge, passion, 
              and stirring spoons (among other things). They make goodness so good, it doesn't know what 
              to do with itself. We do though. We send it to you.
            </p>
          </div>
          <div className="chefs-image">
            <img 
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&h=500&fit=crop" 
              alt="Chef"
            />
          </div>
        </div>
      </section>

      <section className="delivery-section">
        <div className="delivery-content">
          <div className="delivery-image">
            <img 
              src="https://media.istockphoto.com/id/1139946442/vector/pizza-delivery.jpg?s=612x612&w=0&k=20&c=quka93cR5iKM0RgbtzdvOrLg9ZuOvHJSdSlNWvRkq5A=" 
              alt="Timer"
              className="timer-icon"
            />
          </div>
          <div className="delivery-text">
            <h2>45 min delivery</h2>
            <p>Fast and reliable delivery to your doorstep</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
