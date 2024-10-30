import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useFollow = () => {

    const queryClient = useQueryClient();

    const {mutate:follow, isPending} = useMutation({ //Follow/Unfollow mutation
        mutationFn: async(userId) => { //userId = user to follow/unfollow
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: "POST",
                })
    
                const data = await res.json(); //Turn result into json format
                if (!res.ok) {
                    throw new Error(data.error || "Error following/unfollowing");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({queryKey: ['suggestedUsers']}),
                queryClient.invalidateQueries({queryKey: ['authUser']})
            ]);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })
    return {follow, isPending};
}

export default useFollow;