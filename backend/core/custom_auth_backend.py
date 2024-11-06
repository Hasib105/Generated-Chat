from bson import ObjectId
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import User  

class MongoDBJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")
        if not user_id:
            raise AuthenticationFailed("User ID not found in token.")

        try:
            # Use MongoEngine to get the user by ObjectId
            return User.objects.get(id=ObjectId(user_id))
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")
        except Exception as e:
            raise AuthenticationFailed(f"Authentication error: {str(e)}")