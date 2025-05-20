
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Users, MessageSquare, User, Calendar, Plus, Send, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: Profile;
  comment_count?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: Profile;
}

const Community = () => {
  // State
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  
  const { user } = useAuth();

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch all discussions
  const fetchDiscussions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count comments for each discussion
      if (data) {
        for (let discussion of data) {
          const { count, error: countError } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('discussion_id', discussion.id);

          if (!countError) {
            discussion.comment_count = count || 0;
          }
        }
        setDiscussions(data);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments for a specific discussion
  const fetchComments = async (discussionId: string) => {
    setIsCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Create a new discussion post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create posts");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please provide both a title and content for your post");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert([
          {
            user_id: user.id,
            title: newPost.title.trim(),
            content: newPost.content.trim()
          }
        ])
        .select();

      if (error) throw error;

      toast.success("Post created successfully!");
      setIsNewPostDialogOpen(false);
      setNewPost({ title: '', content: '' });
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  // Add a comment to a discussion
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }

    if (!activeDiscussion) {
      toast.error("No active discussion to comment on");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            user_id: user.id,
            discussion_id: activeDiscussion.id,
            content: newComment.trim()
          }
        ])
        .select();

      if (error) throw error;

      setNewComment('');
      fetchComments(activeDiscussion.id);
      
      // Also update the comment count in the discussions list
      fetchDiscussions();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Delete a discussion post
  const handleDeletePost = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete posts");
      return;
    }

    if (confirm("Are you sure you want to delete this post? All comments will also be deleted.")) {
      try {
        const { error } = await supabase
          .from('discussions')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Post deleted successfully");
        if (activeDiscussion?.id === id) {
          setActiveDiscussion(null);
          setComments([]);
        }
        fetchDiscussions();
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  // Delete a comment
  const handleDeleteComment = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete comments");
      return;
    }

    if (confirm("Are you sure you want to delete this comment?")) {
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success("Comment deleted successfully");
        if (activeDiscussion) {
          fetchComments(activeDiscussion.id);
          fetchDiscussions(); // Update comment count
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
      }
    }
  };

  // View a specific discussion and load its comments
  const viewDiscussion = (discussion: Discussion) => {
    setActiveDiscussion(discussion);
    fetchComments(discussion.id);
  };

  // Back to discussions list
  const backToDiscussions = () => {
    setActiveDiscussion(null);
    setComments([]);
  };

  // Load discussions on component mount
  useEffect(() => {
    fetchDiscussions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="mr-2" /> Community Discussion
          </h1>
          <p className="text-gray-500 mt-1">
            Share ideas and discuss financial topics with other members
          </p>
        </div>
        
        {user && (
          <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
                <DialogDescription>
                  Start a new conversation with the community about financial topics.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreatePost} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input 
                    id="title" 
                    placeholder="Topic of discussion" 
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Content</label>
                  <Textarea 
                    id="content" 
                    placeholder="Share your thoughts..." 
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={5}
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewPostDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Post Discussion</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!user && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Join the Conversation</CardTitle>
            <CardDescription>
              You can read all discussions as a guest, but you'll need to sign in to post or comment.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/auth">Sign In or Register</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Discussions List */}
        <div className={`w-full ${activeDiscussion ? 'hidden md:block md:w-1/3' : 'md:w-full'}`}>
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading discussions...</p>
              </CardContent>
            </Card>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Discussions Yet</h3>
                <p className="text-gray-500 mb-4">
                  Be the first to start a conversation in our community.
                </p>
                {user && (
                  <Button onClick={() => setIsNewPostDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Start A Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {discussions.map(discussion => (
                <Card key={discussion.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardHeader className="pb-2">
                    <div onClick={() => viewDiscussion(discussion)}>
                      <CardTitle className="text-lg">{discussion.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <User className="h-3 w-3 mr-1" />
                        <span className="mr-3">{discussion.profiles?.username || 'Unknown user'}</span>
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(discussion.created_at)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2" onClick={() => viewDiscussion(discussion)}>
                    <p className="text-gray-600 line-clamp-2">{discussion.content}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500" onClick={() => viewDiscussion(discussion)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{discussion.comment_count || 0} comments</span>
                    </div>
                    {user && user.id === discussion.user_id && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(discussion.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Discussion Detail View */}
        {activeDiscussion && (
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mb-2 md:hidden"
                    onClick={backToDiscussions}
                  >
                    Back to Discussions
                  </Button>
                  {user && user.id === activeDiscussion.user_id && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeletePost(activeDiscussion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle>{activeDiscussion.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  <span className="mr-3">{activeDiscussion.profiles?.username || 'Unknown user'}</span>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(activeDiscussion.created_at)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{activeDiscussion.content}</p>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-medium mb-4">Comments</h3>
                
                {user ? (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Add your comment..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button type="submit" className="flex items-center">
                        <Send className="mr-2 h-4 w-4" /> Post Comment
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Card className="mb-6">
                    <CardContent className="py-4">
                      <p className="text-center text-sm">
                        <Link to="/auth" className="text-blue-600 hover:underline">Sign in</Link> to join the conversation
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {isCommentsLoading ? (
                  <p className="text-center py-4">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <Card key={comment.id} className="bg-gray-50">
                        <CardHeader className="py-3 px-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center text-sm">
                              <User className="h-3 w-3 mr-1" />
                              <span className="font-medium mr-2">{comment.profiles?.username || 'Unknown user'}</span>
                              <span className="text-gray-500 text-xs">{formatDate(comment.created_at)}</span>
                            </div>
                            {user && user.id === comment.user_id && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <p className="text-sm">{comment.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
