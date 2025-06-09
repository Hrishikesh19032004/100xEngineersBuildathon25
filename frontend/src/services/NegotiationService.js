class NegotiationService {
    static calculateCounterOffer(originalPrice, creatorMetrics) {
      const { avgEngagementRate, followerCount, avgCPM } = creatorMetrics;
      const engagementFactor = Math.min(Math.max(avgEngagementRate / 2, 0.5), 5) / 100;
      const followerFactor = Math.log10(followerCount) * 0.1;
      const cpmFactor = avgCPM / 1000;
      const adjustment = 1 + engagementFactor + followerFactor + (cpmFactor * 0.1);
      const adjustedPrice = originalPrice * Math.min(Math.max(adjustment, 0.8), 1.2);
      return Math.round(adjustedPrice * 100) / 100;
    }
  
    static generateResponse(originalQuotation, creator) {
      const { price, deadline } = originalQuotation.metadata;
      const creatorMetrics = creator.profile.metrics || {};
      const minAcceptablePrice = creator.profile.minimumRate || price * 0.7;
      const counterPrice = this.calculateCounterOffer(price, creatorMetrics);
      
      if (counterPrice >= minAcceptablePrice) {
        return {
          response: 'accept',
          notes: 'This looks good to me!'
        };
      } else if (counterPrice >= minAcceptablePrice * 0.9) {
        return {
          response: 'counter',
          counterPrice: minAcceptablePrice,
          notes: `I can do this for ${minAcceptablePrice} based on my rates.`
        };
      } else {
        return {
          response: 'reject',
          notes: 'This is below my minimum acceptable rate.'
        };
      }
    }
  }
  
  export default NegotiationService;