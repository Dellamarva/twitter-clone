import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from 'react';


const Posts = ({ feedType }) => { //Feedtype = foryou or following

	const getPostEndpoint = () => { //Decide which page to display
		switch (feedType) {
			case "fourYou":
				return "/api/post/all";
			case "following":
				return "/api/post/following";
			default:
				return "/api/post/all";
		}
	}

	const POST_ENDPOINT = getPostEndpoint(); //Get post endpoint

	const {data:posts, isLoading, refetch, isRefetching} = useQuery({ //gets the posts
		queryKey: ["posts"], //Give a unique name to the query and refer to it later (posts)
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT); //Fetch the post endpoint
				const data = await res.json(); //return the post endpoint in json format

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;

			} catch (error) {
					throw new Error(error);
			}
		},
	});

	useEffect(() => { //Call when feedType changes
		refetch();
	}, [feedType, refetch]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;